import { sseResponseEventEnum, TaskResponseKeyEnum } from '@/constants/chat';
import { responseWrite } from '@fastgpt/service/common/response';
import { textAdaptGptResponse } from '@/utils/adapt';
import type { ModuleDispatchProps } from '@/types/core/chat/type';
export type AnswerProps = ModuleDispatchProps<{
  text: string;
}>;
export type AnswerResponse = {
  [TaskResponseKeyEnum.answerText]: string;
};

export const dispatchAnswer = (props: Record<string, any>): AnswerResponse => {
  const {
    res,
    detail,
    stream,
    inputs: { text = '' }
  } = props as AnswerProps;

  const formatText = typeof text === 'string' ? text : JSON.stringify(text, null, 2);

  if (stream) {
    responseWrite({
      res,
      event: detail ? sseResponseEventEnum.answer : undefined,
      data: textAdaptGptResponse({
        text: formatText
      })
    });
  }

  return {
    [TaskResponseKeyEnum.answerText]: formatText
  };
};
