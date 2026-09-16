import AuthForm from "./AuthForm";

// ==========================================
// TYPES
// ==========================================

type AuthPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

// ==========================================
// AUTH PAGE
// ==========================================

export default async function AuthPage({
  searchParams,
}: AuthPageProps) {
  const params = await searchParams;

  const redirect =
    params.redirect || "/account";

  return (
    <AuthForm
      redirect={redirect}
    />
  );
}
