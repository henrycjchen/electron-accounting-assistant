import {Button, Space, Typography} from 'antd';
import {useMemo} from 'react';
import React from 'react';

export default function GenerateOutboundFile({files, onClick}: {files: Record<string, string>; onClick: () => void}) {
  const outputFiles = useMemo(() => {
    const result: string[] = [];
    if (files.outboundInvoices) {
      result.push('出库凭证');
    } else {
      return result;
    }
    if (files.calculate) {
      result.push('入库凭证', '领料单');
    } else {
      return result;
    }
    if (files.inboundInvoices) {
      result.push('收料单');
    }
    return result;
  }, [files]);

  return (
    <Space direction="vertical">
      <Button
        type="primary"
        disabled={!outputFiles.length}
        onClick={onClick}
      >
        生成凭证
      </Button>
      {outputFiles.length ? (
        <Typography.Text v-if="outputFiles.length">
          生成内容：{outputFiles.join('/')}
        </Typography.Text>
      ) : null}
      <Typography.Text>提示：请至少上传《出库发票》</Typography.Text>
    </Space>
  );
}
