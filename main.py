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

# 获取文件夹内所有 .json 文件名
@app.get("/geojson")
async def get_geojson_files():
    geojson_dir = "geojson"  # 这里指向存放GeoJSON文件的文件夹
    geojson_files = [f for f in os.listdir(geojson_dir) if f.endswith('.geojson')]

    return geojson_files

# 获取指定 GeoJSON 文件
@app.get("/geojson/{geojson_filename}")
async def get_geojson(geojson_filename: str):
    geojson_dir = "geojson"  # 这里指向存放GeoJSON文件的文件夹
    
    # 检查 .json 文件是否存在
    geojson_file_path = os.path.join(geojson_dir, geojson_filename)
    if not os.path.exists(geojson_file_path):
        raise HTTPException(status_code=404, detail="GeoJSON file not found")

    # 返回 GeoJSON 文件
    return FileResponse(path=geojson_file_path, media_type='application/json')

