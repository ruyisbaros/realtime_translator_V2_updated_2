from DB.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, ARRAY, Float, Boolean, DateTime
from sqlalchemy.sql.sqltypes import TIMESTAMP, DATETIME
from sqlalchemy.sql.expression import text
from sqlalchemy.orm import relationship


class SubtitleFiles(Base):
    __tablename__ = "subtitles"
    id = Column(Integer, primary_key=True, index=True, nullable=False)
    video_id = Column(String, unique=True, index=True, nullable=False)
    language = Column(String, nullable=False)
    format = Column(String, nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True),
                        nullable=False, server_default=text("now()"))
    updated_at = Column(TIMESTAMP(timezone=True),
                        nullable=False, server_default=text("now()"))
