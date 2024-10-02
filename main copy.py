from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许的源，可以是具体的 URL
    allow_credentials=True,
    allow_methods=["*"],  # 允许的 HTTP 方法
    allow_headers=["*"],  # 允许的 HTTP 头
)

# 获取文件夹内所有 .shp 文件名
@app.get("/shapefiles")
async def get_shapefiles():
    shapefile_dir = "shp"
    shapefiles = [f[:-4] for f in os.listdir(shapefile_dir) if f.endswith('.shp')]

    return shapefiles

# 获取指定 Shapefile 文件和相关文件
@app.get("/shapefiles/{shapefile_name}")
async def get_shapefile(shapefile_name: str):
    shapefile_dir = "shp"
    
    # 检查 .shp 文件是否存在
    shp_file_path = os.path.join(shapefile_dir, shapefile_name)
    print(shp_file_path)
    if not os.path.exists(shp_file_path):
        raise HTTPException(status_code=404, detail="Shapefile not found")

    # 获取与 .shp 文件同名的其他相关文件
    related_files = {
        "shp": shp_file_path,
        "dbf": os.path.join(shapefile_dir, shapefile_name),
        "prj": os.path.join(shapefile_dir, shapefile_name),
        "cpg": os.path.join(shapefile_dir, shapefile_name),
                "shx": os.path.join(shapefile_dir, shapefile_name),
        "zip": os.path.join(shapefile_dir, shapefile_name),


    }

    # 检查并返回文件
    responses = {}
    for key, path in related_files.items():
        if os.path.exists(path):
            responses[key] = FileResponse(path=path, media_type='application/octet-stream')
        else:
            responses[key] = {"error": f"{key.upper()} file not found"}

    return responses
