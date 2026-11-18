import { Alert, Linking } from 'react-native';

export const WEBSITE = 'https://17thdistrictrayac.org';
export const SIGN_IN_URL = `${WEBSITE}/sign-in?source=app`;
export const JOIN_URL = `${WEBSITE}/join?source=app`;

export async function openExternal(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.warn('[links] could not open', url, error);
    Alert.alert(
      'Unable to open',
      "Couldn't open the website. Please check your internet connection and try again."
    );
  }
}

export const openSignIn = (): void => {
  void openExternal(SIGN_IN_URL);
};

export const openJoin = (): void => {
  void openExternal(JOIN_URL);
};
