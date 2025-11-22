package Slim::Utils::OS::Custom;

use strict;

# This is only a stub to make the system realize we're running on Docker.
# The actual Docker.pm is part of the LMS repository.

use base qw(Slim::Utils::OS::Docker);

1;