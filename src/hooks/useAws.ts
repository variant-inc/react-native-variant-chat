import { setS3Keys } from '../lib/S3/S3Bucket';
import { AwsAccessConfig } from '../types/VariantChat';

export const useAws = (awsAccess: AwsAccessConfig): void => {
  if (awsAccess) {
    setS3Keys(awsAccess);
  }

  return;
};
