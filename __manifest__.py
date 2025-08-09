{
    'name': 'POS Customer Display Fullscreen',
    'version': '1.0',
    'category': 'Point of Sale',
    'summary': 'Force customer display to open in fullscreen mode',
    'depends': ['point_of_sale'],
    'assets': {
    'point_of_sale.assets': [
        'pos_customer_display_fullscreen/static/src/js/customer_display_patch.js',
        ],
    },
    'installable': True,
    'application': False,
}
