import os
import re

def process_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                process_file(filepath)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Simple replacements
    replacements = {
        r"version\s*\?\s*'Conectee'\s*:\s*'Simcc'": r"'Simcc'",
        r"version\s*\?\s*\"Conectee\"\s*:\s*\"Simcc\"": r"'Simcc'",
        r"version\s*\?\s*\'a Escola de Engenharia da UFMG\'\s*:\s*\'o SECTI-BA\'": r"'o SECTI-BA'",
        r"version\s*\?\s*'Escola de Engenharia da UFMG'\s*:\s*'SECTI'": r"'SECTI'",
        r"version\s*\?\s*'Escola de Engenharia UFMG'\s*:\s*'SECTI-BA'": r"'SECTI-BA'",
        r"version\s*\?\s*'background'\s*:\s*'background_iapos'": r"'background_iapos'",
        r"version\s*\?\s*<LogoConecteeWhite\s*/>\s*:\s*<LogoIaposWhite\s*/>": r"<LogoIaposWhite />",
        r"version\s*\?\s*<LogoConectee\s*/>\s*:\s*<LogoIapos\s*/>": r"<LogoIapos />",
        r"version\s*\?\s*'conectee\.eng\.ufmg\.br'\s*:\s*'iapos\.cimatec\.com\.br'": r"'iapos.cimatec.com.br'",
        r"version\s*\?\s*'GaIA'\s*:\s*'MarIA'": r"'MarIA'",
        r"version\s*\?\s*'Gaia'\s*:\s*'MarIA'": r"'MarIA'",
        r"version\s*\?\s*'observatorio@secti\.ba\.gov\.br'\s*:\s*'o SECTI-BA'": r"'o SECTI-BA'",
        r"version\s*\?\s*'lg:grid-cols-4'\s*:\s*'lg:grid-cols-3'": r"'lg:grid-cols-3'",
        r"version\s*\?\s*'Simcc'\s*:\s*'Simcc'": r"'Simcc'",
        r"condition:\s*version\b": r"condition: false",
        r"condition:\s*!version\b": r"condition: true",
        r"!version\s*\?\s*normalizedGeoJSON\s*:\s*mgStateGeoJSON": r"normalizedGeoJSON",
        r"!\s*version": r"true",
    }
    
    for pattern, repl in replacements.items():
        content = re.sub(pattern, repl, content)

    # 2. JSX conditional blocks with {version && ( ... )}
    # Using regex to remove the condition but this is hard because of nested parenthesis.
    # Instead, we will replace `{version && (` with `{false && (` to let it be dead code,
    # or just remove it if possible. Let's just do `{version && (` -> `{false && (`
    # Actually, if we just set `const version = false;` in context, it would all work!
    # But user wants to REMOVE the `version` variable completely.
    # Let's replace `{version && (` with `{false && (` and let linter/prettier or manual cleanup handle it.
    content = re.sub(r'\{version\s*&&\s*\(', r'{false && (', content)
    content = re.sub(r'version\s*&&\s*\(', r'false && (', content)
    content = re.sub(r'\bversion\s*\?', r'false ?', content)

    # 3. Clean up useContext hooks
    # const { ..., version, ... } = useContext(UserContext)
    # We remove `version` from the destructured object.
    content = re.sub(r'(\{\s*[^}]*?)\bversion\s*,\s*([^}]*?\})', r'\1\2', content)
    content = re.sub(r'(\{\s*[^}]*?),\s*\bversion\b([^}]*?\})', r'\1\2', content)
    content = re.sub(r'\{\s*\bversion\b\s*\}', r'{}', content)
    
    # 4. Remove `const version = getVersion();` or `const { version } = useContext(...)` if it's the only one
    content = re.sub(r'const\s*\{\s*\}\s*=\s*useContext\([^)]*\);?', '', content)
    content = re.sub(r'const\s+version\s*=\s*getVersion\(\);?', '', content)

    # 5. Remove version from context.tsx
    # We will let the script handle normal usages and we can manually fix context.tsx and App.tsx if needed.

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

if __name__ == "__main__":
    process_directory('/home/JASPION/Simcc/simcc-front/src')
