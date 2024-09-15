import styled from '@emotion/styled';
import {Upload} from 'antd';

export const StyledUpload = styled(Upload)`
  position: relative;
  button {
    display: none;
  }
  &:hover {
    button {
      display: block;
    }
  }
`;
