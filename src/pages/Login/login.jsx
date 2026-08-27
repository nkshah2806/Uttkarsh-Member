import { LoginForm } from "@/components/login-form";
import { useLanguage } from "@/context/LanguageContext";
import login from "../../assets/login.jpg";

export default function Login() {
  const { t } = useLanguage();
  return (
    <div className="min-h-svh bg-slate-50 lg:grid lg:grid-cols-2">
      {/* Left - Login Section */}
      <div className="relative flex min-h-svh flex-col justify-between px-6 py-8 sm:px-10 lg:px-16 xl:px-24">
        {/* Logo / Brand */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
              U
            </div>

            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">
                {t("appName")}
              </h1>
              <p className="text-xs font-medium text-slate-500">
                {t("memberPortal")}
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="mx-auto w-full max-w-md py-12">
          {/* <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-primary">
              MEMBER LOGIN
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Welcome back!
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to access your Utkarsh Corporation member account.
            </p>
          </div> */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            {t("byContinuing")}{" "}
            <a
              href="#"
              className="font-medium text-primary hover:underline"
            >
              {t("termsOfService")}
            </a>{" "}
            {t("and")}{" "}
            <a
              href="#"
              className="font-medium text-primary hover:underline"
            >
              {t("privacyPolicy")}
            </a>
            .
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {t("appName")}</span>

          <span>
            {t("needHelp")}{" "}
            <a
              href="#"
              className="font-medium text-slate-600 hover:text-primary"
            >
              {t("contactSupport")}
            </a>
          </span>
        </div>
      </div>

      {/* Right - Visual Section */}
      <div className="relative hidden overflow-hidden lg:block">
        {/* <img
          src={login}
          alt="Utkarsh Corporation Member Portal"
          className="absolute inset-0 h-full w-full object-cover"
        /> */}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/55 to-primary/40" />

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-12 text-white xl:p-16">
          {/* Top */}
          <div className="flex justify-end">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur-md">
              {t("secureMemberPortal")}
            </span>
          </div>

          {/* Center */}
          <div className="max-w-xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur-md">
              U
            </div>

            <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
              {t("membershipJourney")}
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 xl:text-base">
              {t("memberPortalAccessMsg")}
            </p>

            {/* Feature Cards */}
            <div className="mt-8 grid max-w-lg grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-sm font-semibold">{t("memberProfileFeature")}</p>
                <p className="mt-1 text-xs text-white/60">
                  {t("manageYourInfo")}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-sm font-semibold">{t("secureAccessFeature")}</p>
                <p className="mt-1 text-xs text-white/60">
                  {t("yourDataProtected")}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="text-xs text-white/50">
            {t("trustedAccess")}
          </div>
        </div>
      </div>
    </div>
  );
}