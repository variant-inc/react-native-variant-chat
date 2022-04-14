import S3, { ManagedUpload } from 'aws-sdk/clients/s3';
import { decode } from 'base64-arraybuffer';
import { EventRegister } from 'react-native-event-listeners';
import fs from 'react-native-fs';

import { EventMessageType } from '../../types/EventMessageType.enum';
import { EventName } from '../../types/EventName.enum';
import { AwsAccessConfig } from '../../types/VariantChat';
import { getDriverId } from '../Freshchat/Freshchat';

let accessKeyId: string;
let secretAccessKey: string;
let s3Bucket: string;

export const setS3Keys = (awsAccess: AwsAccessConfig): void => {
  if (awsAccess) {
    accessKeyId = awsAccess.accessKeyId;
    secretAccessKey = awsAccess.secretAccessKey;
    s3Bucket = awsAccess.s3Bucket;
  }
};

export const getS3Keys = (): AwsAccessConfig | null => {
  if (secretAccessKey && secretAccessKey && s3Bucket) {
    return {
      accessKeyId,
      secretAccessKey,
      s3Bucket,
    };
  }

  return null;
};

export const uploadOnS3 = async (
  name: string,
  type: string,
  uri: string,
  callback: (location: string | null) => void
): Promise<void> => {
  // Creating a S3 bucket instance
  try {
    const driverId = await getDriverId();
    const s3bucket = new S3({
      accessKeyId,
      secretAccessKey,
      signatureVersion: 'v4',
    });

    // Params to pass in createBucket() funcion
    const contentType = type;
    const contentDeposition = 'inline;filename="' + name + '"';
    const base64 = await fs.readFile(uri, 'base64');
    const arrayBuffer = decode(base64);
    const currentTime = new Date().toISOString().replace(/[^0-9]/gi, '-');

    s3bucket.createBucket(() => {
      const params = {
        Bucket: s3Bucket,
        Key: `${driverId}/${currentTime}_${name}`,
        Body: arrayBuffer,
        ContentDisposition: contentDeposition,
        ContentType: contentType,
      };

      s3bucket.upload(params, (error: Error, data: ManagedUpload.SendData) => {
        if (error) {
          callback(null);

          EventRegister.emit(EventName.Error, {
            type: EventMessageType.Internal,
            data: {
              message: error.message,
            },
          });
          return;
        }

        // Success
        callback(data?.Location);
      });
    });
  } catch (error: any) {
    callback(null);

    EventRegister.emit(EventName.Error, {
      type: EventMessageType.Internal,
      data: {
        message: error.message,
      },
    });
  }
};
