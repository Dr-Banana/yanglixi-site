# 模板重构指南

## 概述

本次重构将三个创建post的模板（write.tsx, write-recipe.tsx, edit-recipe/[slug].tsx）统一到一个模块化系统中。

## 模块化架构

### 核心组件

1. **BasePostEditor** (`components/admin/BasePostEditor.tsx`)
   - 基础模板组件，组合所有模块
   - 负责布局和UI组合

2. **FormFields** (`components/admin/components/FormFields.tsx`)
   - 基础字段组件（Title, Date, Excerpt等）
   - 根据配置显示/隐藏字段

3. **CoverUpload** (`components/admin/components/CoverUpload.tsx`)
   - Cover图片上传组件
   - 支持两种样式：default和recipe

4. **MDXEditor** (`components/admin/components/MDXEditor.tsx`)
   - MDX body编辑器
   - 包含预览功能

5. **ActionButtons** (`components/admin/components/ActionButtons.tsx`)
   - Save/Publish按钮组件

### Hooks

1. **useCoverUpload** (`components/admin/hooks/useCoverUpload.ts`)
   - 管理cover图片上传逻辑

2. **useMDXPreview** (`components/admin/hooks/useMDXPreview.ts`)
   - 管理MDX预览逻辑

### 类型定义

- **types.ts** (`components/admin/types.ts`)
  - BasePostData
  - PostEditorConfig
  - FormErrors

## 使用示例

### write.tsx 重构示例

```typescript
import BasePostEditor from '@/components/admin/BasePostEditor';
import { useCoverUpload } from '@/components/admin/hooks/useCoverUpload';
import { useMDXPreview } from '@/components/admin/hooks/useMDXPreview';
import { PostEditorConfig } from '@/components/admin/types';

const config: PostEditorConfig = {
  apiEndpoint: '/api/admin/posts/upsert',
  coverApiEndpoint: '/api/admin/posts/cover',
  coverDeleteApiEndpoint: '/api/admin/posts/cover-delete',
  pageTitle: slug ? 'Edit Post' : 'New Post',
  backButtonText: 'Back to Posts',
  backButtonHref: '/admin/posts',
  fields: {
    title: true,
    date: true,
    excerpt: true,
    cookTime: true,
    difficulty: true,
    servings: true,
    category: true,
    tags: true,
    slug: true,
    cover: true,
    body: true,
  },
  validation: {
    requiredFields: ['title', 'date', 'body'],
    validateBody: true,
  },
  style: 'default',
};

// 在组件中使用
const { coverUrl, uploadingCover, onCoverSelect, onDeleteCover } = useCoverUpload({...});
const { previewLoading, previewOn, mdxSource, onTogglePreview } = useMDXPreview(body);

<BasePostEditor
  initial={initial}
  config={config}
  displaySlug={displaySlug}
  errors={missing}
  body={body}
  setBody={setBody}
  coverUrl={coverUrl}
  uploadingCover={uploadingCover}
  onCoverSelect={onCoverSelect}
  onDeleteCover={onDeleteCover}
  previewLoading={previewLoading}
  previewOn={previewOn}
  mdxSource={mdxSource}
  onTogglePreview={onTogglePreview}
  loading={loading}
  publish={publish}
  setPublish={setPublish}
  message={message}
  onSubmit={onSubmit}
/>
```

## 优势

1. **模块化**: 每个功能都是独立模块，可以单独修改
2. **复用性**: 三个模板共享相同的组件和hooks
3. **维护性**: 修改一处即可影响所有模板
4. **可扩展性**: 可以轻松添加新字段或功能


