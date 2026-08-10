import { registerRootComponent } from 'expo';
import App from './src/app';

// This contract tells the native runtime (iOS/Android) 
// that 'App' is the master root component of the entire binary.
registerRootComponent(App);
