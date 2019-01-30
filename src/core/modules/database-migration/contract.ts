interface IDatabaseMigration {
  migrate(): Promise<void>;
  getName(): string;
}

interface MigrationCollection extends Array<{ priority: MigrationPriority; value: IDatabaseMigration }> {}

enum MigrationPriority {
  MEDIUM = 0,
  HIGH,
  HIGHEST,
}

const migrationConst = {
  Priority: 'priority',
  Value: 'value',
};

export { IDatabaseMigration, MigrationCollection, MigrationPriority, migrationConst };
