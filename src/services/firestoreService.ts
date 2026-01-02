import firestore from '@react-native-firebase/firestore';

export const saveSubscription = async (userId: string, subscription: any) => {
  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('subscriptions')
      .add(subscription);
  } catch (error) {
    console.error(error);
  }
};
