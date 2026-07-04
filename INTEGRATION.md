# react-liuren 接入指南 —— 「占事略決古法」新流派引擎

本库输出的 `toGenericChart()` 与 react-liuren 的统一领域模型（`src/engines/types.ts` 的 `LiuRenChart`）字段形状对齐，适配器只需十几行。

## 1. 安装

```bash
# 在 D:\WWW\react-liuren 下
npm install file:../zslj-ts-lib
```

（本地 file: 依赖为符号链接；库目录执行过 `npm run build` 即可被消费，改库后需重新 build。）

## 2. 放宽引擎 id 联合类型

`src/engines/types.ts`：

```ts
export type DaLiuRenEngineId = 'lookfate' | 'mingyu' | 'zslj';
```

## 3. 新建适配器 `src/engines/daliuren/zslj.ts`

```ts
/**
 * zslj-ts-lib（占事略決古法）引擎适配器
 * 平安朝晴明流：涉害孟仲季、寅酉旦暮贵人、卅六卦课体。
 */
import { castByDate, castBySiZhu, toGenericChart } from 'zslj-ts-lib';
import type { ZsljChart } from 'zslj-ts-lib';
import { DI_ZHI, type DaLiuRenEngine, type LiuRenChart } from '../types';

function toChart(zslj: ZsljChart): LiuRenChart {
  const g = toGenericChart(zslj);
  return {
    meta: { engineId: 'zslj', engineName: 'zslj-ts-lib', school: '占事略決古法' },
    dateInfo: {
      bazi: g.dateInfo.bazi,
      ganZhiDate: g.dateInfo.ganZhiDate,
      yueJiang: g.dateInfo.yueJiang,
      xun: g.dateInfo.xun,
      kongWang: g.dateInfo.kongWang,
      dayNight: g.dateInfo.dayNight,
    },
    gong: DI_ZHI.map((diZhi, i) => ({
      diZhi,
      tianZhi: g.gong[i].tianZhi,
      tianJiang: g.gong[i].tianJiang,
      dunGan: g.gong[i].dunGan,
      extras: g.gong[i].extras,
    })),
    siKe: g.siKe.map((k) => ({ name: k.name, shang: k.shang, xia: k.xia, tianJiang: k.tianJiang })),
    sanChuan: {
      chu: g.sanChuan.chu,
      zhong: g.sanChuan.zhong,
      mo: g.sanChuan.mo,
      keTi: g.sanChuan.keTi,
      method: g.sanChuan.method,
    },
    shenSha: g.shenSha,
    extras: g.extras,       // 含 gua36 命中、占断助手、判定路径、原文锚点 refs
    raw: zslj,
  };
}

export const zsljDaLiuRen: DaLiuRenEngine = {
  id: 'zslj',
  name: 'zslj-ts-lib',
  school: '占事略決古法',
  capabilities: {
    siZhu: true,
    shenSha: 'summary',
    yinYangGuiRen: false,   // 原书为单贵人体系（天一治法）
    dunGan: true,           // 仅旬遁干；无建除/初建/伏建（书中无此法）
  },
  byDate: (date) => toChart(castByDate(date)),
  bySiZhu: (y, m, d, h) => toChart(castBySiZhu(y, m, d, h)),
};
```

## 4. 注册

`src/engines/registry.ts`：

```ts
import { zsljDaLiuRen } from './daliuren/zslj';
const daLiuRenEngines: DaLiuRenEngine[] = [lookfateDaLiuRen, mingyuDaLiuRen, zsljDaLiuRen];
```

完成——顶栏流派切换器会自动出现「占事略決古法」，三传对照面板（`buildCompare`）也会自动把古法与通行体系的三传差异并排展示。

## 5. 可选增强

- **判定路径展示**：`chart.extras.path`（`FaStep[]`，每步含 `fa/note/ref`）——可在 SanChuanPanel 里加一个「古法判定路径」折叠块。
- **卅六卦**：`chart.extras.gua36`（命中卦 + 判定说明 + 可信度）——可作为课体卡片。
- **原文引用**：`import { getBookEntry } from 'zslj-ts-lib'`，用 `extras.refs` 里的锚点取《占事略決》条文全文（如做成 tooltip/抽屉）。
- **AI 提示词**：`import { buildClipboardPrompt } from 'zslj-ts-lib'`，替换 JsonExportPanel 的手写提示词，自动带命中原文条文（「依经断课」约束）。
- **月将模式**：`castByDate(date, { yueJiangMode: 'yuejian' })` 复现古书课例（字面月将）；默认 `zhongqi` 中气过宫。

## 注意

- 古法与通行体系三传**本应存在分歧**（涉害/伏吟/返吟/八专等局面），这正是对照价值；差异原因见库 README 的差异表与 react-zslj `docs/algorithm/`。
- 库为 ESM（`type: module`），Vite 直接消费；改库源码后在库目录 `npm run build`。
