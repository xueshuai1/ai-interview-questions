const fs = require('fs');
let content = fs.readFileSync('src/data/articles/synthdata-001.ts', 'utf8');

const oldText = `            code: [
                {
                    lang: "python",
                    code: \`# 使用扩散模型生成合成商品图片
from diffusers import StableDiffusionPipeline
import torch
import os

# 加载预训练模型
pipe = StableDiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16
).to("cuda")

# 商品类别和对应的生成提示词
categories = {
    "luxury_watch": "professional product photo of a luxury wristwatch, white background, studio lighting, high resolution",
    "handbag": "professional product photo of a designer leather handbag, lifestyle scene, natural lighting",
    "sneaker": "professional product photo of premium sneakers, dynamic angle, urban background",
}

# 为每个品类生成合成图片
output_dir = "./synthetic_data"
os.makedirs(output_dir, exist_ok=True)

for category, prompt in categories.items():
    cat_dir = os.path.join(output_dir, category)
    os.makedirs(cat_dir, exist_ok=True)
    
    for i in range(50):  # 每个品类生成 50 张
        # 添加随机种子变化，增加多样性
        image = pipe(
            prompt=prompt,
            num_inference_steps=30,
            guidance_scale=7.5,
            generator=torch.Generator("cuda").manual_seed(i * 100)
        ).images[0]
        
        image.save(f"{cat_dir}/synth_{i:04d}.jpg")
    
    print(f"Generated 50 images for {category}")

# 输出: 
# synthetic_data/
# ├── luxury_watch/  (50 张合成图片)
# ├── handbag/       (50 张合成图片)
# └── sneaker/       (50 张合成图片)\`,
                    filename: "generate_synthetic_images.py",
                },
            ],`;

const newText = `            code: [
                {
                    lang: "python",
                    code: \`# 使用扩散模型生成合成商品图片
from diffusers import StableDiffusionPipeline
import torch
import os

# 加载预训练模型
pipe = StableDiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16
).to("cuda")

# 商品类别和对应的生成提示词
categories = {
    "luxury_watch": "professional product photo of a luxury wristwatch, white background, studio lighting, high resolution",
    "handbag": "professional product photo of a designer leather handbag, lifestyle scene, natural lighting",
    "sneaker": "professional product photo of premium sneakers, dynamic angle, urban background",
}

# 为每个品类生成合成图片
output_dir = "./synthetic_data"
os.makedirs(output_dir, exist_ok=True)

for category, prompt in categories.items():
    cat_dir = os.path.join(output_dir, category)
    os.makedirs(cat_dir, exist_ok=True)
    
    for i in range(50):  # 每个品类生成 50 张
        # 添加随机种子变化，增加多样性
        image = pipe(
            prompt=prompt,
            num_inference_steps=30,
            guidance_scale=7.5,
            generator=torch.Generator("cuda").manual_seed(i * 100)
        ).images[0]
        
        image.save(f"{cat_dir}/synth_{i:04d}.jpg")
    
    print(f"Generated 50 images for {category}")

# 输出: 
# synthetic_data/
# ├── luxury_watch/  (50 张合成图片)
# ├── handbag/       (50 张合成图片)
# └── sneaker/       (50 张合成图片)\`,
                    filename: "generate_synthetic_images.py",
                },
                {
                    lang: "python",
                    code: \`# 合成数据质量评估 pipeline
# 综合统计相似性 + 下游任务性能验证
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from scipy.spatial.distance import jensenshannon

def statistical_similarity(real_data, synthetic_data, n_bins=50):
    """计算合成数据与真实数据的统计相似性
    
    使用 Jensen-Shannon 散度评估每个特征维度的分布差异。
    JS 散度范围 [0, 1]，0 表示完全相同，1 表示完全不同。
    合格标准：JS < 0.1 表示分布足够接近。
    """
    n_features = real_data.shape[1]
    js_distances = []
    for i in range(n_features):
        real_min, real_max = real_data[:, i].min(), real_data[:, i].max()
        bins = np.linspace(real_min, real_max, n_bins)
        real_hist, _ = np.histogram(real_data[:, i], bins=bins, density=True)
        synth_hist, _ = np.histogram(synthetic_data[:, i], bins=bins, density=True)
        real_hist = real_hist + 1e-10
        synth_hist = synth_hist + 1e-10
        real_hist /= real_hist.sum()
        synth_hist /= synth_hist.sum()
        js = jensenshannon(real_hist, synth_hist)
        js_distances.append(js)
    return np.mean(js_distances), js_distances

def downstream_task_evaluation(X_real, y_real, X_synth, y_synth, X_test, y_test):
    """下游任务评估：在合成数据上训练，在真实数据上测试
    
    这是最终的质量检验标准：如果合成数据训练的模型在真实测试集上
    的性能接近真实数据训练的模型（>=90%），说明合成数据质量合格。
    """
    synth_model = RandomForestClassifier(n_estimators=100, random_state=42)
    synth_model.fit(X_synth, y_synth)
    synth_acc = synth_model.score(X_test, y_test)
    real_model = RandomForestClassifier(n_estimators=100, random_state=42)
    real_model.fit(X_real, y_real)
    real_acc = real_model.score(X_test, y_test)
    relative_performance = synth_acc / real_acc if real_acc > 0 else 0
    return {
        "synthetic_model_accuracy": String(synth_acc.toFixed(4)),
        "real_model_accuracy": String(real_acc.toFixed(4)),
        "relative_performance": (relative_performance * 100).toFixed(1) + "%",
        "passed": relative_performance >= 0.90,
    }

// 使用示例
const makeClassification = require('sklearn'); // 伪代码示意
// from sklearn.datasets import make_classification
// X_real, y_real = make_classification(n_samples=5000, n_features=20, ...)
// X_synth = X_real + np.random.normal(0, 0.1, X_real.shape)
// X_train, X_test, y_train, y_test = train_test_split(X_real, y_real, test_size=0.2)
// mean_js = statistical_similarity(X_train, X_synth)
// result = downstream_task_evaluation(X_train, y_train, X_synth, y_synth, X_test, y_test)\`,
                    filename: "evaluate_synthetic_data.py",
                },
            ],`;

if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    fs.writeFileSync('src/data/articles/synthdata-001.ts', content);
    console.log('Done - replaced successfully');
} else {
    console.log('Old text NOT found');
    // Debug: show what's around the code block
    const idx = content.indexOf('generate_synthetic_images.py');
    if (idx >= 0) {
        console.log('Found generate_synthetic_images.py at index', idx);
        console.log('Context:', content.substring(idx - 50, idx + 200));
    }
}
