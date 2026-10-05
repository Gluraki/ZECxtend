import asyncio
import logging
import sys

from seed.runner import main

logging.basicConfig(level=logging.INFO, format="%(levelname)-5.5s [seed] %(message)s")
loop_factory = asyncio.SelectorEventLoop if sys.platform == "win32" else None
asyncio.run(main(), loop_factory=loop_factory)
