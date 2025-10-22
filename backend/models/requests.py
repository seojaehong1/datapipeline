from pydantic import BaseModel

class PreprocessRequest(BaseModel):
    filepath: str
    preprocessing_config: dict

class ExportRequest(BaseModel):
    filepath: str
    db_config: dict
    table_name: str
    if_exists: str = "replace"