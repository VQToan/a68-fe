import { Amplify } from "aws-amplify";

// AWS Cognito Configuration
export const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId:
        import.meta.env.VITE_AWS_USER_POOL_ID || "ap-southeast-1_tQpLbjn6G",
      userPoolClientId:
        import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID ||
        "3ab80kt4mkjq3kus506l99pgad",
    },
  },
};

// Configure Amplify
Amplify.configure(cognitoConfig);

export default cognitoConfig;
