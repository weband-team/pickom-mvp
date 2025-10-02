import { useRouter } from "next/navigation";
import { handleRegister } from "../api/auth";
import { useAuthStore } from "../hooks/use-auth-store";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../config/firebase-config";

export function useAuthLogic() {
  const authStore = useAuthStore();
  const router = useRouter();

  const handleLogin = async (role: string, accessToken: string, phone?: string, name?: string) => {
    const response = await handleRegister(role, accessToken, phone, name);
    console.log('response', response.data);
    authStore.set({
      user: response.data,
      status: 'authenticated',
    });
  };

  const handleSignUp = async (role: string, email: string, password: string, phone: string, name: string): Promise<void> => {
    try {
      console.log('handleSignUp', role, email, password, phone, name);
      console.log('auth', auth);
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log('userCredentials', userCredentials);
      const accessToken = await userCredentials.user.getIdToken();
      console.log('accessToken', accessToken);
      await handleLogin(role, accessToken, phone, name);
      console.log('handleLogin', role, accessToken, phone);
      if (role === 'picker') {
        router.push('/driver-dashboard');
      } else {
        router.push('/');
      }

    } catch (error: unknown) {
      throw error;
    }
  }

  async function handleSignIn(role: string, email: string, password: string): Promise<void> {
    try {
      const userCredentials = await signInWithEmailAndPassword(auth, email, password);
      const accessToken = await userCredentials.user.getIdToken();
      console.log(accessToken);

      await handleLogin(role, accessToken);
      if (role === 'picker') {
        router.push('/driver-dashboard');
      } else {
        router.push('/');
      }
    } catch (error: unknown) {

      throw error;
    }
  }

  return {
    handleSignUp,
    handleSignIn,
  };
}