import { memo, useCallback, useMemo, useState } from 'react'
import { IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import TranslateIcon from '@mui/icons-material/Translate'
import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '@i18n'

type SupportedLanguage = keyof typeof supportedLanguages

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const languageOptions = useMemo(
    () => Object.entries(supportedLanguages) as Array<[SupportedLanguage, string]>,
    []
  )

  const handleToggle = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleChangeLanguage = useCallback(
    (language: SupportedLanguage) => {
      void i18n.changeLanguage(language)
      handleClose()
    },
    [handleClose, i18n]
  )

  return (
    <>
      <Tooltip title={t('language.label')}>
        <IconButton
          color="inherit"
          onClick={handleToggle}
          size="small"
          aria-haspopup="true"
          aria-controls={open ? 'language-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          sx={{ ml: { xs: 0.5, sm: 1 } }}
        >
          <TranslateIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {languageOptions.map(([language, label]) => (
          <MenuItem
            key={language}
            selected={i18n.language === language}
            onClick={() => handleChangeLanguage(language)}
          >
            <Typography component="span" variant="body2">
              {t(`language.${language}`, { defaultValue: label })}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default memo(LanguageSwitcher)
