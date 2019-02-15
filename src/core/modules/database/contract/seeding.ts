interface IDatabaseSeeder {
    seed(): Promise<void>;
    getName(): string;
}

interface SeederCollection extends Array<{ priority: SeedPriority, value: IDatabaseSeeder }> { }

enum SeedPriority{
    MEDIUM = 0,
    HIGH,
    HIGHEST
}

const seedConst =  {
    Priority: 'priority',
    Value: 'value'
};

export { IDatabaseSeeder, SeederCollection, SeedPriority, seedConst };