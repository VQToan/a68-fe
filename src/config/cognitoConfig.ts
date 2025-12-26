import { Amplify } from "aws-amplify";

// AWS Cognito Configuration
export const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId:
        import.meta.env.VITE_AWS_USER_POOL_ID || "ap-south-1_lR5JUmjEz",
      userPoolClientId:
        import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID ||
        "3a0v714cceo4kr9la5mst09t64",
    },
  },
};

// Configure Amplify
Amplify.configure(cognitoConfig);

export default cognitoConfig;
