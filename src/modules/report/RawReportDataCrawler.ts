import { Injectable } from '@nestjs/common';
import { RepositoryBase, RepositoryFactory } from 'core/modules/database/factory';
import { LoggingService } from 'core/modules/logging';
import { JobBase } from 'core/modules/task-scheduler/base-jobs';
import { HistorySchema, IHistoryDocument } from 'documents/history';
import { ISettingDocument, SettingSchema } from 'documents/setting';
import { get , isEmpty, isNil, keyBy, maxBy, round, trim } from 'lodash';
import { SETTING_KEY } from 'shared-modules/setting/constant';

@Injectable()
export class RawReportDataCrawler extends JobBase {
    name: 'RawReportDataCrawler';
    logger: any;
    historyRepository: RepositoryBase<IHistoryDocument>;
    settingRepository: RepositoryBase<ISettingDocument>;

    constructor(loggingService: LoggingService,
                private readonly repositoryFactory: RepositoryFactory) {
        super();
        this.interval = '@hourly';
        this.logger = loggingService.createLogger('RawReportDataCrawler');
        this.resolveServicesAsync();
    }

    private async resolveServicesAsync() {
        this.historyRepository = await this.repositoryFactory.getRepository<IHistoryDocument>('history', HistorySchema);
        this.settingRepository = await this.repositoryFactory.getRepository<ISettingDocument>('setting', SettingSchema);
    }

    protected async execute() {
        await this.crawlRawData();
    }

    async crawlRawData() {
        this.logger.info('[crawlRawData]...START');

        const ftpSettingQuery = {
            key: {
                $regex: 'FTP_'
            }
        };
        const ftpSettings = await this.settingRepository.find(ftpSettingQuery);
        const ftpSetting = keyBy(ftpSettings, 'key');

        const jsFtp = require('jsftp');
        const ftp = new jsFtp({
            host: get(ftpSetting[SETTING_KEY.FTP_HOST], 'value'),
            port: +get(ftpSetting[SETTING_KEY.FTP_PORT], 'value'),
            user: get(ftpSetting[SETTING_KEY.FTP_USER], 'value'),
            pass: get(ftpSetting[SETTING_KEY.FTP_PASS], 'value'),
        });

        const locationData = await this.settingRepository.findOne({key: SETTING_KEY.RAW_DATA_PATH});
        const location = locationData.value;

        ftp.ls(`./${location}`, (err, res) => {
            if (err) {
                this.logger.error('cannot read file from ftp server');
                return;
            }
            const lastedFile = maxBy(res, 'time');

            if (lastedFile) {
                ftp.get(`./${location}/${lastedFile.name}`, (err, socket) => {
                    if (err) {
                        this.logger.error('get file occurs error. Err: ', err);
                        return;
                    }

                    const buffers = [];
                    socket.on('data', d => {
                        buffers.push(d);
                    });

                    socket.on('close', err => {
                        if (err) {
                            this.logger.error('There was an error retrieving the file.');
                        }
                        if (!isEmpty(buffers)) {
                            const fileData = Buffer.concat(buffers);
                            this.processingFile(fileData, lastedFile.name);
                        }
                    });

                    socket.resume();

                });
            }
        });

        this.logger.info('[crawlRawData]...END');
    }

    async processingFile(fileBuffer, fileName) {
        this.logger.info('processing...START;fileName=', fileName);
        const Excel = require('exceljs');
        const stream = require('stream');

        const workbook = new Excel.Workbook();
        const readStream = new stream.PassThrough();
        const writeStream = workbook.xlsx.createInputStream();
        readStream.end(fileBuffer);
        readStream.pipe(writeStream);

        writeStream.on('done', () => {
            const moment = require('moment');
            const worksheet = workbook.getWorksheet(1);
            worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
                    try {
                        if (rowNumber !== 1) {
                            const history = this.getHistoryFromRowData(row, rowNumber, moment);
                            const existHistory = await this.historyRepository.findOne({source: history.source, connectTime: history.connectTime});
                            if (!existHistory) {
                                await this.historyRepository.create(history);
                            }
                        }
                    } catch (err) {
                        this.logger.error(`Failed to sync at row ${rowNumber}. Err=`, err);
                    }
                });
            this.logger.info('REAL DONE');
        });

        this.logger.info('PROCESSING...END');
    }

    formatRawDateTime(rawValue, moment) {
        if (isNil(rawValue) || trim(rawValue) === '') {
            return null;
        }

        let fragments = rawValue.split('Vietnam');
        if (isEmpty(fragments)) {
            fragments = rawValue.split('EST');
        }

        if (isEmpty(fragments)) {
            return null;
        }

        const day = fragments[1];
        const hour = fragments[0];
        if (isNil(day) || isNil(hour)) {
            return null;
        }

        const formattedValue = `${trim(day)} ${trim(hour)}`;
        return moment(formattedValue);
    }

    getHistoryFromRowData(row, rowNumber, moment) {
        const sequence = rowNumber - 1;
        const source = row.getCell(22).value; // clid
        const destination = row.getCell(23).value; // dnis
        const callOrigin = row.getCell(14).value; // h323-call-origin
        const connectTime = this.formatRawDateTime(row.getCell(10).value, moment); // h323-connect-time
        const disconnectTime = this.formatRawDateTime(row.getCell(11).value, moment); // h323-disconnect-time
        const duration = isNil(disconnectTime) || isNil(connectTime)
        ? 0
        : round(moment.duration(disconnectTime.diff(connectTime)).asMinutes(), 2);

        const history = {
            sequence,
            source,
            destination,
            callOrigin,
            connectTime: isNil(connectTime) ? connectTime : connectTime.unix(),
            disconnectTime: isNil(disconnectTime) ? disconnectTime : disconnectTime.unix(),
            duration: duration.toString(),
        };

        return history;
    }
}