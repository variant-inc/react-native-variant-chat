import { setS3Keys } from '../lib/S3/S3Bucket';
import { AwsAccessConfig } from '../types/VariantChat';

export const useAws = (awsAccess: AwsAccessConfig): void => {
  setS3Keys(awsAccess);
  return;
};
