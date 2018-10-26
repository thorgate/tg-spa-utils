# `tg-loading-bar`

Controlled loading bar component. This helps displaying application loading information to the user.

## Usage

```
import { LoadingBar } from 'tg-loading-bar';

class App {
    state = {
        isLoading: false,
    };

    // simulate loading
    startLoading = () => this.setState({ isLoading: true }, this.finishLoading);

    finishLoading = () => {
        setTimeout(() => {
            this.setState({ isLoading: false });
        }, 500);
    };

    render() {
    }
}
```
