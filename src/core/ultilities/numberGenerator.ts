
export class NumberGenerator {
    public static generate(length: number): string {
        let string = '';
        while (string.length < length){
            const randomnumber = Math.floor(Math.random() * 100) + 1;
            string += randomnumber.toString();
        }
        if (string.length > length) {
            string = string.substr(0, length);
        }
        return string;
    }
}