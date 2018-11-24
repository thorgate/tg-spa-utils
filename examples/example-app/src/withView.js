import { connectView } from '@thorgate/spa-view';


export const withView = target => (
    connectView({ onComponentError: (error) => { console.log(error); }})(target)
);
