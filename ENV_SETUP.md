# Environment Variables Setup

To configure your application, create a `.env` file in the root directory of your project with the following variables:

```
# Logo URL - Replace with your actual logo URL
NEXT_PUBLIC_LOGO_URL=/logo.svg

# Authentication
NEXT_PUBLIC_AUTH_ENABLED=true

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Other configuration
NEXT_PUBLIC_SITE_NAME=DevMTR
NEXT_PUBLIC_SITE_DESCRIPTION=A modern e-commerce platform
```

## Important Notes

1. All environment variables that need to be accessible in the browser must be prefixed with `NEXT_PUBLIC_`.
2. After creating or modifying the `.env` file, restart your Next.js development server for the changes to take effect.
3. Do not commit the `.env` file to version control. It's already included in the `.gitignore` file.

## Using Environment Variables in Your Code

You can access these environment variables in your code like this:

```javascript
// For client-side code
const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;

// For server-side code
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Logo Configuration

To change the logo:

1. Place your logo image in the `public` directory
2. Update the `NEXT_PUBLIC_LOGO_URL` in your `.env` file to point to your logo
3. For example: `NEXT_PUBLIC_LOGO_URL=/your-logo.png`
