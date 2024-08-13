import {Flex, message, Select, Space} from 'antd';
import {useState} from 'react';
import UploadFiles from '../components/UploadFiles';
import {generateCalculateFile} from '#preload';
import ModifyCalculation from './components/ModifyCalculation';

export default function CalculateTable() {
  const [company, setCompany] = useState<string>('捷锦');
  const [files, setFiles] = useState<Record<string, string>>({});

  async function handleUploadChange(uploads: Record<string, string>) {
    setFiles(uploads);
  }

  async function handleGenerateFile() {
    message.loading('生成中');
    try {
      await generateCalculateFile(JSON.parse(JSON.stringify(files)));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      message.error(e.message.match(/Error: ([^:]*)$/)?.[1] ?? e.message);
      return;
    }
    message.destroy();
    message.success('生成完成');
  }
  return (
    <Space direction="vertical">
      <Flex
        gap="small"
        align="center"
      >
        <span> 公司： </span>
        <Select
          value={company}
          style={{flex: 1}}
          onChange={setCompany}
          placeholder="请选择公司"
        >
          <Select.Option value="捷锦">捷锦</Select.Option>
        </Select>
      </Flex>
      <UploadFiles onChange={handleUploadChange} />

      <ModifyCalculation
        files={files}
        onGenerateFile={handleGenerateFile}
      />
    </Space>
  );
}
