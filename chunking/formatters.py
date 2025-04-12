import re
import pandas as pd
from pathlib import Path

file_path = Path("../data/submissions/netherlands/2025_wording.md") #path manage different OS system automatically
print(file_path.suffix)

output_path = Path("output/new_file_2.csv")

def md_to_csv(file_path, output_path, min_block_size=50, max_block_size=200):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Nettoyer le contenu
    # Remplacer les retours à la ligne multiples par un seul espace
    content = re.sub(r'\n+', ' ', content)
    # Nettoyer les espaces multiples
    content = re.sub(r'\s+', ' ', content)
    # Nettoyer les caractères spéciaux inutiles
    content = re.sub(r'[^\w\s.,;:!?()\-\'"]', '', content)
    
    # Split par les titres Markdown et les points
    chunks = []
    current_chunk = []
    
    # Diviser le contenu en lignes pour détecter les titres
    lines = content.split('. ')
    for line in lines:
        # Si c'est un titre Markdown, créer un nouveau chunk
        if re.match(r'^#+\s', line):
            if current_chunk:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
            chunks.append(line)
        else:
            current_chunk.append(line)
            
            # Si le chunk actuel atteint la taille maximale, le sauvegarder
            if len(' '.join(current_chunk).split()) >= max_block_size:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
    
    # Ajouter le dernier chunk s'il existe
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    # Filtrer les chunks trop courts
    final_chunks = [chunk for chunk in chunks if len(chunk.split()) >= min_block_size]

    # Export
    df = pd.DataFrame({
        "id": range(1, len(final_chunks) + 1),
        "content": final_chunks
    })

    df.to_csv(output_path, index=False)
    print(f"Export CSV OK : {output_path}")

md_to_csv(file_path, output_path)

print("start")
