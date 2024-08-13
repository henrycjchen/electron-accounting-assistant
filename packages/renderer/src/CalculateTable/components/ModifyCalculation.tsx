import {Button, Space, Typography} from 'antd';
import {useMemo} from 'react';

export default function ModifyCalculation({files, onGenerateFile}: {files: Record<string, string>; onGenerateFile: () => void}) {
  const requireFiles = useMemo(() => {
    const result: string[] = [];
    if (!files.outboundInvoices) {
      result.push('出库发票');
    }
    if (!files.calculate) {
      result.push('测算表');
    }
    if (!files.inboundInvoices) {
      result.push('购进发票');
    }
    return result;
  }, [files]);

  return (
    <Space direction="vertical">
      <Button
        type="primary"
        disabled={!!requireFiles.length}
        onClick={onGenerateFile}
      >
        修改测算表
      </Button>
      {requireFiles.length ? (
        <Typography.Text>提示：请上传{requireFiles.join(', ')}</Typography.Text>
      ) : null}
    </Space>
  );
}
