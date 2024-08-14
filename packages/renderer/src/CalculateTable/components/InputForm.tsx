/* eslint-disable @typescript-eslint/no-explicit-any */
import {Col, Flex, Form, InputNumber, Row} from 'antd';
import type {ICalculationForm, IInitCalculationForm} from '@@/types/types';
import {useEffect} from 'react';
import {css} from '@emotion/react';

export default function InputForm({
  onSubmit,
  initialValues,
}: {
  onSubmit: any;
  initialValues?: IInitCalculationForm;
}) {
  const [form] = Form.useForm<ICalculationForm>();

  useEffect(() => {
    onSubmit(form.getFieldsValue());
  }, []);

  const onFormLayoutChange = () => {
    onSubmit(form.getFieldsValue());
  };

  return (
    <Form
      size="small"
      form={form}
      onValuesChange={onFormLayoutChange}
      css={css`
        .ant-form-item {
          margin-bottom: 5px;
        }
      `}
    >
      <Flex gap={10}>
        <Form.Item
          label="本期增加 E11"
          name="currentIncrease"
        >
          <InputNumber placeholder={(initialValues?.currentIncrease || 0).toFixed(2)} />
        </Form.Item>
        <Form.Item
          label="本期认证 F11"
          name="currentAuth"
        >
          <InputNumber placeholder={(initialValues?.currentAuth || 0).toFixed(2)} />
        </Form.Item>
      </Flex>
      <Form.Item
        label="已缴纳税额 K21"
        name="paidTax"
      >
        <InputNumber
          addonBefore={(initialValues?.paidTax || 0).toFixed(2) + ' +'}
          placeholder="0.00"
        />
      </Form.Item>
      <Form.Item
        label="实际利润总额 K28"
        name="realProfitTotal"
      >
        <InputNumber
          addonBefore={(initialValues?.realProfitTotalBase || 0).toFixed(2) + ' +'}
          placeholder={(initialValues?.realProfitTotal || 0).toFixed(2)}
        />
      </Form.Item>
      <Flex gap={10}>
        <Form.Item
          label="运费 B16"
          name="freight"
        >
          <InputNumber placeholder={(initialValues?.freight || 0).toFixed(2)} />
        </Form.Item>
        <Form.Item
          label="办公 B22"
          name="office"
        >
          <InputNumber placeholder={(initialValues?.office || 0).toFixed(2)} />
        </Form.Item>
        <Form.Item
          label="差旅 B23"
          name="travel"
        >
          <InputNumber placeholder={(initialValues?.travel || 0).toFixed(2)} />
        </Form.Item>
      </Flex>
      <Flex gap={10}>
        <Form.Item
          label="业务 B24"
          name="business"
        >
          <InputNumber placeholder={(initialValues?.business || 0).toFixed(2)} />
        </Form.Item>
        <Form.Item
          label="手续费 B34"
          name="commission"
        >
          <InputNumber placeholder={(initialValues?.commission || 0).toFixed(2)} />
        </Form.Item>
        <Form.Item
          label="利息 B35"
          name="interest"
        >
          <InputNumber placeholder={(initialValues?.interest || 0).toFixed(2)} />
        </Form.Item>
      </Flex>
      <Form.Item
        label="累计销售 B59"
        name="cumulativeSales"
      >
        <InputNumber
          addonBefore={(initialValues?.cumulativeSalesBase || 0).toFixed(2) + ' +'}
          placeholder={(initialValues?.cumulativeSales || 0).toFixed(2)}
        />
      </Form.Item>
      <Form.Item
        label="已交增值税 B61"
        name="paidVat"
      >
        <InputNumber
          addonBefore={(initialValues?.paidVatBase || 0).toFixed(2) + ' +'}
          placeholder={(initialValues?.paidVat || 0).toFixed(2)}
        />
      </Form.Item>
      <Flex gap={10}>
        <Form.Item
          label="用电度数 B8/K3"
          name="electricityNumber"
        >
          <InputNumber placeholder={(initialValues?.electricityNumber || 0).toFixed(2)} />
        </Form.Item>
        <Form.Item
          label="用电金额 M3"
          name="electricityCost"
        >
          <InputNumber placeholder={(initialValues?.electricityCost || 0).toFixed(2)} />
        </Form.Item>
        <Form.Item
          label="用电税额 N3"
          name="electricityTax"
        >
          <InputNumber placeholder={(initialValues?.electricityTax || 0).toFixed(2)} />
        </Form.Item>
      </Flex>
    </Form>
  );
}
