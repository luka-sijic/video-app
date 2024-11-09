declare namespace JSX {
    interface IntrinsicElements {
      'hls-video': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        autoplay?: boolean;
        controls?: boolean;
        muted?: boolean;
      };
    }
  }