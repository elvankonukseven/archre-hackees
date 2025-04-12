from pathlib import Path

# file_path = Path("../data/submissions/netherlands/2024_wording.md") #path manage different OS system automatically
# print(file_path.suffix)

# Load Balancer: Determine the best function to use based on the file type

# def load_file(file_path):
#     ext = Path(file_path).suffix.lower()

#     if ext == ".pdf":
#         return extract_text_pdf(file_path)
#     elif ext == ".docx":
#         return extract_text_docx(file_path)
#     elif ext == ".txt":
#         return extract_text_txt(file_path)
#     elif ext == ".html":
#         return extract_text_html(file_path)
#     elif ext == ".xlsx":
#         return extract_text_excel(file_path)
#     elif ext == ".md":
#         return extract_text_md(file_path)
#     else:
#         raise ValueError(f"Extension {ext} non supportée")
