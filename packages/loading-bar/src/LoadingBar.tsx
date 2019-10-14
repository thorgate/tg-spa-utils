import React, { Component, CSSProperties } from 'react';

// Declare window value is undefined in some cases
// TSLint detects that window is always defined otherwise
declare var window: Window | undefined;

export interface LoadingBarProps {
    isLoading: boolean;
    simulate: boolean;
    hideDelay: number;
    simulateInterval: number;
    className?: string;
    style?: CSSProperties;
}

interface LoadingBarState {
    percent: number;
    delayShow: boolean;
    delayHide: boolean;
}

export class LoadingBar extends Component<LoadingBarProps, LoadingBarState> {
    public static defaultProps: Partial<LoadingBarProps> = {
        isLoading: false,
        simulate: false,
        hideDelay: 500,
        simulateInterval: 500,
    };

    public state: LoadingBarState = {
        percent: 0,
        delayShow: false,
        delayHide: false,
    };

    protected simulateInterval: number | null | undefined = null;

    public componentDidUpdate(prevProps: LoadingBarProps) {
        if (prevProps.isLoading !== this.props.isLoading) {
            if (this.props.isLoading) {
                this.show();

                if (this.props.simulate) {
                    this.startSimulate();
                }
            } else {
                this.hide();
                this.stopSimulate();
            }
        }
    }

    public componentWillUnmount() {
        this.stopSimulate();
    }

    public show = () => {
        this.setState(prevState => ({
            delayShow: true,
            percent: this.calculateVisiblePercentage(prevState.percent),
        }));

        // Clear the delay flag
        setTimeout(() => {
            this.setState({
                delayShow: false,
            });
        });
    };

    public hide = () => {
        this.setState({
            delayHide: true,
            percent: 1,
        });

        // Clear the delay flag & hide loading bar
        setTimeout(
            () =>
                this.setState({
                    delayHide: false,
                    percent: 0,
                }),
            this.props.hideDelay
        );
    };

    public calculateVisiblePercentage = (percentage: number): number => {
        const percent = percentage || 0;

        let random = 0;

        if (percent >= 0 && percent < 0.25) {
            // When between 0% and less than 25% pick a number from 0% to 12%
            random = (Math.random() * 12) / 100;
        } else if (percent >= 0.25 && percent < 0.65) {
            // When between 25% and less than 65% pick a number from 0% to 3%
            random = (Math.random() * 3) / 100;
        } else if (percent >= 0.65 && percent < 0.9) {
            // When between 65% and less than 90% pick a number from 0% to 2%
            random = (Math.random() * 2) / 100;
        } else if (percent >= 0.9 && percent < 0.99) {
            // When between 65% and less than 90% always use 0.5%
            random = 0.005;
        }

        // New percent will be combination of previous and generated random value
        return percent + random;
    };

    // istanbul ignore next: Simulate is ignored in tests
    public startSimulate() {
        if (window !== undefined) {
            if (this.props.simulateInterval > 0) {
                this.stopSimulate();

                this.simulateInterval = window.setInterval(
                    this.show,
                    this.props.simulateInterval
                );
            }
        }
    }

    // istanbul ignore next: Simulate is ignored in tests
    public stopSimulate() {
        if (window !== undefined) {
            if (this.simulateInterval) {
                window.clearInterval(this.simulateInterval);
                this.simulateInterval = null;
            }
        }
    }

    public loadingBarStyles(style?: CSSProperties) {
        const { percent, delayHide, delayShow } = this.state;

        return {
            ...style,

            width: delayShow ? 0 : `${percent * 100}%`,
            display: delayHide || percent > 0 ? 'block' : 'none',
        };
    }

    public render() {
        const { className, style } = this.props;

        return (
            <div
                className={`tg-loading-bar ${className || ''}`}
                style={this.loadingBarStyles(style)}
            />
        );
    }
}
