export interface ErrorMessages {
    network: string;
    invalidResponseCode: string;
}


export const defaultMessages: ErrorMessages = {
    network: 'Bad response from server, try again later',
    invalidResponseCode: 'Bad response from server, try again later',
};
