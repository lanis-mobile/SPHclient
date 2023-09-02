declare module 'sphclient' {
    export default class SPHclient {
        constructor(username: string, password: string, schoolID: number, loggingLevel?: number);
        authenticate(callback: () => void): void;
        logout(callback: () => void): void;
        getVplan(date: Date, callback: () => void): void;
        getNextVplanDate(callback: () => void): void;
        getCalendar(start: Date, end: Date, callback: () => void): void;
    }
}
