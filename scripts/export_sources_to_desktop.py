import os
import shutil
import zipfile
import subprocess
import sys

def main():
    print("=" * 60)
    print("Exporting HR-Digital sources to Desktop...")
    print("=" * 60)

    # 1. Update consolidated source text and markdown files
    print("\n[Step 1/4] Generating consolidated single-file sources...")
    try:
        subprocess.run([sys.executable, "scripts/export_all_sources.py"], check=True)
    except Exception as e:
        print(f"Warning: export_all_sources.py encountered an error: {e}")

    # 2. Identify target Desktop directories
    home = os.path.expanduser("~")
    desktop_dirs = []
    
    onedrive_desktop = os.path.join(home, "OneDrive", "Desktop")
    regular_desktop = os.path.join(home, "Desktop")

    if os.path.exists(onedrive_desktop):
        desktop_dirs.append(onedrive_desktop)
    if os.path.exists(regular_desktop):
        desktop_dirs.append(regular_desktop)
    else:
        try:
            os.makedirs(regular_desktop, exist_ok=True)
            desktop_dirs.append(regular_desktop)
        except Exception:
            pass

    # Deduplicate desktop paths
    desktop_dirs = list(dict.fromkeys([os.path.abspath(d) for d in desktop_dirs]))
    print(f"\nTarget Desktop locations identified: {len(desktop_dirs)}")
    for d in desktop_dirs:
        print(f"  - {d}")

    # 3. Determine clean source files to include
    ignored_dir_names = {
        "node_modules",
        ".git",
        "dist",
        ".vercel",
        ".codex-pptx-build",
        "__pycache__",
        ".pytest_cache",
    }

    ignored_files = {
        ".DS_Store",
        "Thumbs.db",
    }

    source_root = os.path.abspath(".")
    files_to_copy = []

    for root, dirs, files in os.walk(source_root):
        # Exclude ignored directories in-place
        dirs[:] = [d for d in dirs if d not in ignored_dir_names]

        for file in files:
            if file in ignored_files:
                continue
            if file.endswith(".tmp") or file.endswith(".local") or file.endswith(".log"):
                continue
            # Exclude large zip files if inside workspace to avoid recursion
            if file.endswith(".zip") and ("HR_Digital" in file or "test" in file):
                continue
            
            rel_path = os.path.relpath(os.path.join(root, file), source_root)
            files_to_copy.append(rel_path)

    print(f"\n[Step 2/4] Found {len(files_to_copy)} clean source files to copy.")

    # 4. Copy project folder to each desktop directory
    print("\n[Step 3/4] Copying full project directory to Desktop...")
    for d in desktop_dirs:
        dest_folder = os.path.join(d, "HR-Digital")
        if os.path.exists(dest_folder):
            shutil.rmtree(dest_folder, ignore_errors=True)
        os.makedirs(dest_folder, exist_ok=True)

        copied_count = 0
        for rel_path in files_to_copy:
            src_f = os.path.join(source_root, rel_path)
            dest_f = os.path.join(dest_folder, rel_path)
            os.makedirs(os.path.dirname(dest_f), exist_ok=True)
            shutil.copy2(src_f, dest_f)
            copied_count += 1

        print(f"  [OK] Copied {copied_count} files into folder: {dest_folder}")

    # 5. Create clean ZIP archive
    print("\n[Step 4/4] Creating ZIP archive on Desktop...")
    temp_zip_name = "HR_Digital_Sources.zip"
    temp_zip_path = os.path.join(source_root, temp_zip_name)

    with zipfile.ZipFile(temp_zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for rel_path in files_to_copy:
            file_abs = os.path.join(source_root, rel_path)
            # Store in zip inside 'HR-Digital/' root
            zipf.write(file_abs, arcname=os.path.join("HR-Digital", rel_path))

    zip_size_kb = os.path.getsize(temp_zip_path) / 1024

    for d in desktop_dirs:
        dest_zip = os.path.join(d, "HR_Digital_Sources.zip")
        dest_all_zip = os.path.join(d, "HR_Digital_All_Sources.zip")
        shutil.copy2(temp_zip_path, dest_zip)
        shutil.copy2(temp_zip_path, dest_all_zip)
        print(f"  [OK] Saved ZIP archive ({zip_size_kb:.1f} KB): {dest_zip}")

    # Copy final presentation pptx to desktop for convenience if present
    presentation_file = os.path.join(source_root, "deliverables", "Digital_HR_Jana_Post_3_slides_final.pptx")
    if os.path.exists(presentation_file):
        for d in desktop_dirs:
            dest_pptx = os.path.join(d, "Digital_HR_Jana_Post_Presentation.pptx")
            shutil.copy2(presentation_file, dest_pptx)
            print(f"  [OK] Saved Presentation PPTX: {dest_pptx}")

    # Clean up local temporary zip in scratch
    if os.path.exists(temp_zip_path):
        os.remove(temp_zip_path)

    print("\n" + "=" * 60)
    print("SUCCESS: All source files and archives successfully sent to Desktop!")
    print("=" * 60)

if __name__ == "__main__":
    main()
