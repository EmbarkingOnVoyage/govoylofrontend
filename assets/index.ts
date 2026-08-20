// Look inside your existing root assets folder and create an index.ts file there:
import apple from './apple-logo.png';
import google from './google-logo.png';
import facebook from './facebook-logo.png';

export const LOGO_ASSETS: Record<string, any> = {
  apple: apple,
  google: google,
  facebook: facebook,
};
