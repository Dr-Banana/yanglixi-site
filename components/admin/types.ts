// 基础Post数据类型
export interface BasePostData {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  cookTime?: string | null;
  difficulty?: string | null;
  servings?: string | null;
  category?: string | null;
  tags?: string[] | null;
  coverUrl?: string | null;
}

// Post编辑器配置
export interface PostEditorConfig {
  // API端点
  apiEndpoint: string;
  coverApiEndpoint: string;
  coverDeleteApiEndpoint: string;
  
  // 页面配置
  pageTitle: string;
  backButtonText: string;
  backButtonHref: string;
  
  // 字段配置
  fields: {
    title: boolean;
    date: boolean;
    excerpt: boolean;
    cookTime: boolean;
    difficulty: boolean;
    servings: boolean;
    category: boolean;
    tags: boolean;
    slug: boolean;
    cover: boolean;
    body?: boolean; // 用于简单MDX body
  };
  
  // 验证规则
  validation: {
    requiredFields: string[];
    validateBody?: boolean; // 是否验证body字段
  };
  
  // 样式配置
  style?: 'default' | 'recipe'; // 样式主题
}

// 表单字段错误状态
export interface FormErrors {
  title?: boolean;
  date?: boolean;
  body?: boolean;
  [key: string]: boolean | undefined;
}


