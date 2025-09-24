import os
import re
import argparse

JS_DIR = "js"
SHADER_DIR = "shaders"

TEMPLATE = "index.template.html"
OUTPUT = "index.html"

parser = argparse.ArgumentParser(description="Bundle JS and GLSL shaders into HTML.")
parser.add_argument(
    "--minify",
    action="store_true",
    help="Enable minification of JS, GLSL, and HTML (default: off)",
)
args = parser.parse_args()
minify = args.minify

def strip_js_imports(content):
    content = re.sub(r"\bimport\b.*?;", "", content)
    content = re.sub(r"\bexport\b\s+", "", content)
    return content.strip()

def minify_js(content):
    content = strip_js_imports(content)
    content = re.sub(r"//.*", "", content)
    content = re.sub(r"/\*.*?\*/", "", content, flags=re.DOTALL)
    content = re.sub(r"\s+", " ", content)
    return content.strip()

def minify_glsl(content):
    content = re.sub(r"//.*", "", content)
    content = re.sub(r"/\*.*?\*/", "", content, flags=re.DOTALL)
    content = re.sub(r"\s+", " ", content)
    return content.strip()

def minify_html(html):
    html = re.sub(r"<!--.*?-->", "", html, flags=re.DOTALL)
    html = re.sub(r">\s+<", "><", html)
    html = re.sub(r"\s+", " ", html)
    return html.strip()

with open(TEMPLATE, "r", encoding="utf-8") as f:
    html = f.read()

shader_files = [f for f in os.listdir(SHADER_DIR) if f.endswith(".glsl")]
shader_scripts = []

for file in shader_files:
    path = os.path.join(SHADER_DIR, file)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    shader_type = "vertex" if file.endswith(".vs.glsl") else "fragment"

    if minify:
        shader_scripts.append(
            f'<script id="{file}" type="x-shader/x-{shader_type}">{minify_glsl(content)}</script>'
        )
    else:
        shader_scripts.append(
            f'<script id="{file}" type="x-shader/x-{shader_type}">\n{content}\n</script>'
        )

js_files = [f for f in os.listdir(JS_DIR) if f.endswith(".js")]
js_content = ""

for file in js_files:
    path = os.path.join(JS_DIR, file)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        if minify:
            js_content += minify_js(content)
        else:
            js_content += strip_js_imports(content) + "\n"

if minify:
    js_script_tag = f"<script>{js_content}</script>"
else:
    js_script_tag = f"<script>\n{js_content}\n</script>"

injection = "\n".join(shader_scripts + [js_script_tag])
html = html.replace("<!-- INJECTION_HERE -->", injection)
if minify:
    html = minify_html(html)

with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(html)

def readable_bytes(num_bytes):
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if num_bytes < 1024:
            return f"{num_bytes:.2f} {unit}"
        num_bytes /= 1024

print(f"Bundled into {OUTPUT}, size: {readable_bytes(os.path.getsize(OUTPUT))}")
