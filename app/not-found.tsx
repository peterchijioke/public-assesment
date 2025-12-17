import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-x-hidden w-full">
      <div className="text-center px-4 w-full max-w-md mx-auto">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Oops! Page not found
        </p>
        <Link
          href="/"
          className="text-primary underline hover:text-primary-hover"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
