declare module "SPHclient" {
  export class SPHclient {
    constructor(username: string, password: string, schoolID: number, loggingLevel?: number);

    authenticate(): Promise<void>;
    logout(): Promise<void>;
    getVplan(date: Date | any): Promise<any>; // Replace 'any' with your actual Vplan data type
    getNextVplanDate(): Promise<Date | null>;
    getCalendar(start: Date, end: Date): Promise<any>; // Replace 'any' with your actual calendar data type

    // You can define other methods and properties as needed

    // Add your type definitions for class properties here
  }

  export default SPHclient;
}
