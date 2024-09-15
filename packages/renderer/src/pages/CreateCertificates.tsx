import {message, Space} from 'antd';
import UploadFiles from '../components/UploadFiles';
import {useState} from 'react';
import GenerateOutboundFile from '../components/GenerateOutboundFile';
import {generateOutboundFile} from '#preload';
import React from 'react';

export default function Page() {
  const [files, setFiles] = useState<Record<string, string>>({});

  async function onGenerateOutboundFile() {
    message.loading('生成中');
    try {
      await generateOutboundFile(JSON.parse(JSON.stringify(files)));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      message.error(e.message.match(/Error: ([^:]*)$/)?.[1] ?? e.message);
      return;
    }
    message.destroy();
    message.success('生成完成');
  }

  async function handleUploadChange(uploads: Record<string, string>) {
    setFiles(uploads);
  }

  return (
    <Space direction="vertical">
      <UploadFiles onChange={handleUploadChange} />
      <GenerateOutboundFile
        files={files}
        onClick={onGenerateOutboundFile}
      />
    </Space>
  );
}
