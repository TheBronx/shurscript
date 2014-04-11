# coding: utf-8

"""
Compone archivos unos dentros de otros
"""

from __future__ import unicode_literals
from __future__ import print_function

import re
import os

with open('template.js') as f:
    contents = [line.decode('utf-8').strip('\n') for line in f]


re_import = re.compile(r'{(.*)}')

with open('composed.user.js', 'w') as target:

    for line in contents:
        match = re_import.match(line)

        if match:
            include = match.groups()[0]
            with open(include) as f:

                for inc_line in f:
                    inc_line = inc_line.decode('utf-8').strip('\n')

                    print(inc_line.encode('utf-8'), file=target)

        else:
            print(line, file=target)


