declare module 'sphclient' {
  export class SPHclient {
    constructor(username: string, password: string, schoolID: number, loggingLevel?: number);
    authenticate(): Promise<void>;
    logout(): Promise<void>;
    getVplan(date: Date | any): Promise<Object>; // Replace 'any' with your actual Vplan data type
    getNextVplanDate(): Promise<Date | null>;
    getCalendar(start: Date, end: Date): Promise<Object>; // Replace 'any' with your actual calendar data type
  }
  export default SPHclient;
}
