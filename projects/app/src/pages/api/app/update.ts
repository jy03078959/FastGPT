import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase } from '@/service/mongo';
import { authUser } from '@fastgpt/service/support/user/auth';
import { App } from '@/service/models/app';
import type { AppUpdateParams } from '@/types/app';
import { authApp } from '@/service/utils/auth';
import { SystemOutputEnum } from '@/constants/app';

/* 获取我的模型 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { name, avatar, type, share, intro, modules } = req.body as AppUpdateParams;
    const { appId } = req.query as { appId: string };

    if (!appId) {
      throw new Error('appId is empty');
    }

    // 凭证校验
    const { userId } = await authUser({ req, authToken: true });

    await authApp({
      appId,
      userId
    });

    // 更新模型
    await App.updateOne(
      {
        _id: appId,
        userId
      },
      {
        name,
        type,
        avatar,
        intro,
        ...(share && {
          'share.isShare': share.isShare,
          'share.isShareDetail': share.isShareDetail
        }),
        ...(modules && {
          modules: modules.map((modules) => ({
            ...modules,
            outputs: modules.outputs.sort((a, b) => {
              // finish output always at last
              if (a.key === SystemOutputEnum.finish) return 1;
              if (b.key === SystemOutputEnum.finish) return -1;
              return 0;
            })
          }))
        })
      }
    );

    jsonRes(res);
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
