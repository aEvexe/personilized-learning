import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-player': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          autoplay?: boolean;
          loop?: boolean;
          speed?: string;
        },
        HTMLElement
      >;
    }
  }
}
