import { Redirect } from "expo-router";

export default function Index() {
  // Direct to home screen (hymn list)
  return <Redirect href="/(tabs)/(home)" />;
}