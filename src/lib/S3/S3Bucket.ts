import S3 from 'aws-sdk/clients/s3';
import { decode } from 'base64-arraybuffer';
import fs from 'react-native-fs';

import { AwsAccessConfig } from '../../types/VariantChat';

let accessKeyId: string;
let secretAccessKey: string;
let bucketName: string;

export const setS3Keys = (awsAccess: AwsAccessConfig): void => {
  accessKeyId = awsAccess.accessKeyId;
  secretAccessKey = awsAccess.secretAccessKey;
  bucketName = awsAccess.s3Bucket;
};

export const uploadOnS3 = async (
  name: string,
  type: string,
  uri: string
): Promise<void> => {
  // Creating a S3 bucket instance
  const s3bucket = new S3({
    accessKeyId,
    secretAccessKey,
    Bucket: bucketName,
    signatureVersion: 'v4',
  });

  // Params to pass in createBucket() funcion
  const contentType = type;
  const contentDeposition = 'inline;filename="' + name + '"';
  const base64 = await fs.readFile(uri, 'base64');
  const arrayBuffer = decode(base64);

  s3bucket.createBucket(() => {
    const params = {
      Bucket: bucketName,
      // If you want to create a folder and then save file(s) in that
      // do this key:`${folder_name}\${name}`
      // else
      Key: name,
      Body: arrayBuffer,
      ContentDisposition: contentDeposition,
      ContentType: contentType,
    };

    s3bucket.upload(params, (error: any, data: any) => {
      console.log(data);
      if (error) {
        return console.log('Error in callback: ', error);
      }
      console.log('Success');
      console.log('Response URL : ' + data.Location);
    });
  });
};
