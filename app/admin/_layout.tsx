import { Slot } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)', // قل له البداية من مجلد التابات
};

export default function AdminLayout() {
  return <Slot />;
}
